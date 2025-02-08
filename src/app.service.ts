import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getMain(): string {
    return 'This API is working! <br> API for stock & crypto <br><hr> By Thinnakrit Chankate';
  }
}
