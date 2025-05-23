export const getEventColor = (colorId: number) => {
  const colors = {
    1: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    2: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    3: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
    4: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    5: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    6: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
    7: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
    8: { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
  };
  
  return colors[colorId as keyof typeof colors] || colors[1];
};