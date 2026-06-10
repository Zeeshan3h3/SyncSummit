export const getDeterministicImage = (seed, width = 800, height = 600) => {
  if (!seed) return `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=${width}&h=${height}&fit=crop&q=80`;
  
  const themes = [
    '1540575467063-178a50c2df87', // Conference crowd
    '1551818255-e6e10975bc17', // Neon tech event
    '1505373877841-8d25f7d46678', // Presentation screen
    '1559223607-a43c990c692c', // Badge/lanyard
    '1504384308090-c894fdcc538d', // Networking
    '1475721025512-70066928d1ce', // Tech setup
    '1515187029135-18ee286d815b', // Meeting discussion
    '1523580494863-6f3031224c94'  // Stage
  ];

  // Simple string hashing function
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Get positive index within themes array
  const index = Math.abs(hash) % themes.length;
  const imageId = themes[index];
  
  return `https://images.unsplash.com/photo-${imageId}?w=${width}&h=${height}&fit=crop&q=80`;
};

export const getPlaceholderImage = (width = 800, height = 600) => {
  return `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=${width}&h=${height}&fit=crop&q=80`;
};
