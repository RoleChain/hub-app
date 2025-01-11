const Chat = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex h-full w-full flex-col rounded-md bg-white px-4 py-4 sm:pb-12 sm:pl-16 sm:pr-12 sm:pt-6">
      {children}
    </div>
  );
};
export default Chat;
