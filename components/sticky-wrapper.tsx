type Props = {
  children: React.ReactNode;
};

export const StickyWrapper = ({ children }: Props) => {
  return (
    <div className="hidden lg:block w-[368px] sticky bottom-6 self-end">
      <div className="min-h-[calc(100vh-48px)] sticky top-6 flex flex-col space-y-4">
        {children}
      </div>
    </div>
  );
};
