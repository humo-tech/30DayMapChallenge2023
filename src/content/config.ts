// 1. `astro:content`からユーティリティをインポート
import { z, defineCollection } from 'astro:content'
// 2. コレクションを定義
const days = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    description: z.string(),
  }),
})
// 3. コレクションを登録するために、単一の`collections`オブジェクトをエクスポート
//    このキーは、"src/content"のコレクションのディレクトリ名と一致する必要があります。
export const collections = {
  days,
}
