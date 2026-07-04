import { useState } from "react";

const Tooltip = (props) => {
  return (
    <div
      className="bg-stone-900 text-white p-[10px]! py-[5px]! rounded-[5px]! fixed"
      {...props}
    >
      {props.children}
    </div>
  );
};

const AllStories = ({ args, componentsMap }) => {
  const componentNames = Object.keys(componentsMap);

  const [name, setName] = useState("");
  const [position, setPosition] = useState({ x: null, y: null });

  const onMouseOver = ({ event, name }) => {
    setName(name);
    setPosition({ x: event.clientX, y: event.clientY });
  };

  const onMouseLeave = () => {
    setName("");
    setPosition({ x: null, y: null });
  };

  return (
    <div className="flex flex-wrap" onMouseLeave={onMouseLeave}>
      {componentNames.map((name, idx) => {
        const Component = componentsMap[name]; // 문자열로 컴포넌트 선택
        if (!Component) return null;
        return (
          <Component
            key={idx}
            {...args}
            onMouseOver={(event) => onMouseOver({ event, name })}
          />
        );
      })}
      {name && (
        <Storybook.Tooltip
          style={{ top: position.y! + 15, left: position.x! + 15 }}
        >
          {`<${name} />`}
        </Storybook.Tooltip>
      )}
    </div>
  );
};

const Storybook = {
  Tooltip,
  AllStories,
};

export default Storybook;
