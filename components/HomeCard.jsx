'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

const HomeCard = ({ className, img, title, description, handleClick }) => {
  return (
    <div>
      <div
        className={cn(
          'bg-orange-500 flex flex-col w-full xl:max-w-[270px] min-h-[260px] rounded-[14px] px-5 pt-4 pb-5 cursor-pointer',
          className
        )}
        onClick={handleClick}
      >
        <div className="glassmorphism size-12 rounded-[10px] flex items-center justify-center">
          <Image src={img} alt="meeting" height={35} width={35} />
        </div>

        <div className="mt-auto flex flex-col gap-1 pt-4">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text text-white text-opacity-80">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default HomeCard;
