interface TabListProps {
  children: React.ReactNode;
}

/** 탭 버튼들을 감싸는 컨테이너 */
export const TabList = ({ children }: TabListProps) => {
  return (
    <div role="tablist" className="flex">
      {children}
    </div>
  );
};
