"use server";
import { prisma } from '@/lib/db';
import { assertAuthenticated } from '@/lib/auth-actions';
import { z } from 'zod';

const soalSetLinkSchema = z.object({
  koleksiSoalId: z.number().int().positive(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  order: z.number().int().min(0).default(0),
});

export async function saveSoalSetLink(kelasId: number, data: z.infer<typeof soalSetLinkSchema>, soalSetId?: number) {
  try {
    const session = await assertAuthenticated();
    const valid = soalSetLinkSchema.parse(data);

    // Verify kelas ownership
    const kelas = await prisma.kelas.findUnique({ where: { id: kelasId }, select: { authorId: true } });
    if (!kelas || kelas.authorId !== session.user.id) {
      return { success: false, error: 'Not authorized' };
    }

    let record;
    if (soalSetId) {
      // Update only order and relation if needed; title/description may not exist yet if migration pending
      record = await prisma.kelasKoleksiSoal.update({
        where: { id: soalSetId },
        data: {
          order: valid.order,
          // @ts-ignore optional fields (after migration)
          title: (valid as any).title,
          // @ts-ignore
          description: (valid as any).description,
          koleksiSoalId: valid.koleksiSoalId,
        },
      });
    } else {
      record = await prisma.kelasKoleksiSoal.create({
        data: {
          kelasId,
          koleksiSoalId: valid.koleksiSoalId,
          order: valid.order,
          title: (valid as any).title,    
          description: (valid as any).description,
        },
      });
    }

    return { success: true, data: record };
  } catch (e) {
    console.error('saveSoalSetLink error', e);
    return { success: false, error: 'Failed to save soal set link' };
  }
}
