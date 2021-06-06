export default function Hint({ keyName, label, children }) {
  return (
    <div className="flex items-center mb-2 opacity-50">
      <span className="bg-gray-300 text-gray-800 px-2 py-0.5 rounded inline-flex items-center text-sm mr-2 justify-center w-32">
        {children} {keyName}
      </span>
      <p className="text-sm">{label}</p>
    </div>
  );
}
