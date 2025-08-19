'use client';
import { useUser } from '@clerk/nextjs';

export default function ShowUserId() {
  const { user } = useUser();
  if (!user) return null;

  console.log(user.id);

  return;
}
