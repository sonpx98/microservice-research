import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    private readonly logger = new Logger(ApiKeyGuard.name);

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['x-api-key'];

        // Get API key from environment
        const validApiKey = process.env.CRAWLER_API_KEY;

        if (!validApiKey) {
            this.logger.warn('⚠️ CRAWLER_API_KEY not set in environment variables');
            throw new UnauthorizedException('API authentication not configured');
        }

        if (!apiKey) {
            this.logger.warn('❌ Missing API key in request');
            throw new UnauthorizedException('Missing API key');
        }

        if (apiKey !== validApiKey) {
            this.logger.warn('❌ Invalid API key provided');
            throw new UnauthorizedException('Invalid API key');
        }

        this.logger.log('✅ API key validated successfully');
        return true;
    }
}
