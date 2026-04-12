import { redirect } from 'next/navigation';

export default function OrderRedirect({ params }: { params: { id: string } }) {
    redirect(`/order-status/${params.id}`);
}
