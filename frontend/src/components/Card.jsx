export default function Card({ title, value, children }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow w-full h-full flex flex-col">
      {children}
      <div className="text-gray-500 text-sm mt-2">{title}</div>
      <div className="font-semibold text-lg mt-1">{value}</div>
    </div>
  );
}