import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ThreadService {
  constructor(
    private prisma: PrismaService,
    private http: HttpService,
  ) {}

  async create(ownerId: string, payload: CreateThreadDto) {
    const { memberIds, sources, ...rest } = payload;
    const validSources = await this.checkSources(sources);
    return this.prisma.thread.create({
      data: {
        ...rest,
        source: { createMany: { data: validSources, skipDuplicates: true } },
        threadMember: {
          createMany: {
            skipDuplicates: true,
            data: [
              ...memberIds.map((id) => ({ userId: id })),
              { userId: ownerId, role: 'OWNER', isEnabled: false },
            ],
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.thread.findUniqueOrThrow({ where: { id } });
  }

  async findMany(userId: string) {
    return this.prisma.thread.findMany({
      where: { threadMember: { some: { userId } } },
    });
  }

  private async checkSources(ids: string[]) {
    const result = await Promise.allSettled(
      ids.map(async (id) => {
        const { data } = await lastValueFrom(
          this.http.get<{ data: { id: string; name: string } }>(
            `/workgroups/${id}`,
          ),
        );
        return { workgroupId: data.data.id, workgroupName: data.data.name };
      }),
    );
    const rejected = result.filter((res) => res.status === 'rejected');
    if (rejected[0]) console.log(rejected[0]);
    const filtered = result
      .filter((res) => res.status === 'fulfilled')
      .map((item) => item.value);
    return filtered;
  }
}
