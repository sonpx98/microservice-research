import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
    @Get('health')
    getHealth() {
        return {
            status: 'ok',
            service: 'gateway',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    }

    @Get('ping')
    ping() {
        return { message: 'pong' };
    }
}