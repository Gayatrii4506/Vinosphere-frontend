import { bookingRepository } from './booking.repository';
import { db } from '../../adapters/database';
import { sendEmail } from '../../shared/utils/email';
import { supabaseAdmin } from '../../config/supabase';

export class BookingService {
  async getAllBookings(filters?: Record<string, any>) {
    return await bookingRepository.findAll(filters);
  }

  async getBookingById(id: string) {
    const booking = await bookingRepository.findById(id);
    if (!booking) throw new Error(`Booking with ID ${id} not found`);
    return booking;
  }

  async createBooking(data: any) {
    // 1. Resolve winery_id automatically from experience or event if not supplied
    if (!data.winery_id) {
      if (data.experience_id) {
        const exp = await db.findOne('experiences', { id: data.experience_id });
        if (exp) {
          data.winery_id = exp.winery_id;
        }
      } else if (data.event_id) {
        const evt = await db.findOne('events', { id: data.event_id });
        if (evt) {
          data.winery_id = evt.winery_id;
        }
      }
    }

    // 2. Normalize enums to lowercase to match live Supabase database constraints
    if (data.booking_status) {
      data.booking_status = data.booking_status.toLowerCase();
    }
    if (data.payment_status) {
      data.payment_status = data.payment_status.toLowerCase();
    }

    const booking = await bookingRepository.create(data);

    // 3. Trigger ticket email asynchronously in the background
    this.sendTicketEmail(booking).catch(err => {
      console.error('Failed to send ticket email:', err);
    });

    return booking;
  }

  private async sendTicketEmail(booking: any) {
    try {
      // 1. Get user details from public.users table
      const user = await db.findOne('users', { id: booking.user_id });
      let userEmail = user?.email;
      let userName = user?.full_name || 'Valued Guest';

      // Fallback: If not found in public.users, fetch from supabase auth admin API
      if (!userEmail) {
        const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.getUserById(booking.user_id);
        if (authUser && authUser.user) {
          userEmail = authUser.user.email;
          userName = authUser.user.user_metadata?.full_name || authUser.user.email || 'Valued Guest';
        }
      }

      if (!userEmail) {
        console.warn(`[sendTicketEmail] User email not found for user ID: ${booking.user_id}`);
        return;
      }

      // 2. Resolve experience or event title and winery name
      let title = 'VinoSphere Experience';
      let wineryName = 'Our Partner Winery';
      if (booking.experience_id) {
        const exp = await db.findOne('experiences', { id: booking.experience_id });
        if (exp) {
          title = exp.title;
          const winery = await db.findOne('wineries', { id: exp.winery_id });
          if (winery) wineryName = winery.name;
        }
      } else if (booking.event_id) {
        const evt = await db.findOne('events', { id: booking.event_id });
        if (evt) {
          title = evt.title;
          const winery = await db.findOne('wineries', { id: evt.winery_id });
          if (winery) wineryName = winery.name;
        }
      }

      const ticketCode = `VINO-${booking.id.slice(0, 8).toUpperCase()}`;

      // 3. Compile beautiful HTML template
      const htmlContent = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #FDFCF7; border: 1px solid #ECECEC; border-radius: 24px; color: #222222;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #6D071A; font-family: 'Georgia', serif; font-size: 28px; margin: 0; letter-spacing: 1px;">V I N O S P H E R E</h2>
            <p style="font-size: 11px; text-transform: uppercase; tracking-spacing: 2px; color: #8F8F8F; margin: 5px 0 0 0;">Your Premium Wine Tour Concierge</p>
          </div>
          
          <div style="border-top: 2px solid #6D071A; border-bottom: 2px solid #6D071A; padding: 20px 0; margin-bottom: 35px;">
            <h3 style="font-size: 18px; margin: 0 0 10px 0; color: #222222; text-align: center;">RESERVATION CONFIRMED</h3>
            <p style="font-size: 13px; line-height: 1.6; margin: 0; text-align: center; color: #555555;">
              Dear <strong>${userName}</strong>,<br>
              Your booking for <strong>${title}</strong> has been successfully processed. Here are your reservation details:
            </p>
          </div>
          
          <div style="background-color: #FFFFFF; border: 1px dashed #D4AF37; border-radius: 16px; padding: 20px; margin-bottom: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 8px 0; color: #8F8F8F; width: 35%;">Ticket Code:</td>
                <td style="padding: 8px 0; font-family: monospace; font-weight: bold; color: #6D071A; font-size: 14px;">${ticketCode}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #8F8F8F;">Winery:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #222222;">${wineryName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #8F8F8F;">Date:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #222222;">${booking.booking_date}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #8F8F8F;">Guests:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #222222;">${booking.guests} Ticket(s)</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #8F8F8F;">Total Amount:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #222222; font-size: 15px; color: #D4AF37;">₹${Number(booking.total_amount).toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; font-size: 12px; color: #8F8F8F; line-height: 1.5;">
            <p style="margin: 0 0 10px 0;">Please present this email ticket on your arrival at the vineyard entrance for QR code scanning.</p>
            <p style="margin: 0; font-style: italic; color: #6D071A;">Cheers to an exquisite harvest journey!</p>
          </div>
        </div>
      `;

      // 4. Send email
      await sendEmail({
        to: userEmail,
        subject: `Your VinoSphere Ticket Confirmation: ${ticketCode}`,
        html: htmlContent
      });
    } catch (error) {
      console.error('[sendTicketEmail] Error processing ticket email:', error);
    }
  }

  async updateBooking(id: string, data: any) {
    await this.getBookingById(id);
    return await bookingRepository.update(id, data);
  }

  async deleteBooking(id: string) {
    await this.getBookingById(id);
    return await bookingRepository.delete(id);
  }
}

export const bookingService = new BookingService();
