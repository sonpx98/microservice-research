import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from './guards/api-key.guard';

@Controller()
@UseGuards(ApiKeyGuard)
export class HealthController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'processor',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('ping')
  ping() {
    return { message: 'pong' };
  }
}