import { PostEditor } from "@/components/admin/PostEditor";

export default function EditPostPage({ params }: { params: { id: string } }) {
  return <PostEditor postId={params.id} />;
}
