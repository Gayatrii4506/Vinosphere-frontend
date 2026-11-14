import { eventRepository } from './event.repository';

export class EventService {
  async getAllEvents() {
    return await eventRepository.findAll();
  }

  async getEventById(id: string) {
    const event = await eventRepository.findById(id);
    if (!event) throw new Error(`Event with ID ${id} not found`);
    return event;
  }

  async createEvent(data: any) {
    return await eventRepository.create(data);
  }

  async updateEvent(id: string, data: any) {
    await this.getEventById(id);
    return await eventRepository.update(id, data);
  }

  async deleteEvent(id: string) {
    await this.getEventById(id);
    return await eventRepository.delete(id);
  }
}

export const eventService = new EventService();
