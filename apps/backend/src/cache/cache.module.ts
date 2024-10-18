import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}

// Configured cache module - Modified: 2025-12-25 20:07:24
// Added lines for commit changes
// Change line 1 for this commit
// Change line 2 for this commit
// Change line 3 for this commit
// Change line 4 for this commit
// Change line 5 for this commit
// Change line 6 for this commit
// Change line 7 for this commit
// Change line 8 for this commit
// Change line 9 for this commit
// Change line 10 for this commit
