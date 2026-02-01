import { getVotars } from "@/lib/votar";

export async function GET(req) {
  try {
    const votars = await getVotars();
    return new Response(JSON.stringify(votars), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
