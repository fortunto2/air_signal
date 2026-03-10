export const fetchOpenMeteo = async (endpoint: string, params: Record<string, string>) => {
  const url = new URL(`https://api.open-meteo.com/v1/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`Open-Meteo API error: ${response.statusText}`);
  return response.json();
};
