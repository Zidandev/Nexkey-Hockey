<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GeminiController extends Controller
{
    // Generate cheeks arcade game dialogues based on score goals or chats
    public function generateDialogue(Request $request)
    {
        try {
            $scorer = $request->input('scorer');
            $puckVelocity = (float)$request->input('puckVelocity');
            $priorAiMessage = $request->input('priorAiMessage');
            $playerReply = $request->input('playerReply');
            $phase = (int)$request->input('phase');

            $apiKey = config('app.gemini_api_key');

            // Fallback replies if API Key is not configured
            if (!$apiKey) {
                $fallback = 'Ayo main lagi!';
                if ($phase === 1) {
                    if ($scorer === 'player') {
                        $fallback = $puckVelocity > 15 
                            ? 'Seramnyaa, pelan-pelan pliss!' 
                            : 'Alah pengecut, beraninya nunggu!';
                    } else {
                        $fallback = 'Hahaha masuk! Makanya naikin skillnya dulu!';
                    }
                } else {
                    $fallback = 'Alah banyak alesan, ayo tanding lagi aja!';
                }
                return response()->json([
                    'success' => true,
                    'text' => $fallback
                ]);
            }

            $modelName = 'gemini-3.5-flash';
            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$modelName}:generateContent?key={$apiKey}";

            $systemPrompt = "You are playing as an arcade Air Hockey opponent against a human player in our retro cabinet game \"Nexkey\". "
                . "Your personality is highly energetic, witty, extremely competitive, cheeky, funny, and dramatic. "
                . "You must respond in an engaging, casual blend of Malaysian/Indonesian gaming slang (and occasional English) with some code-switching (gamer lingo, conversational phrasing, playful jabs). "
                . "Keep your response short (strictly under 15 words) and extremely punchy. Do not use hashtags, prefixes like \"AI:\", or markdown headers.";

            $userPrompt = '';

            if ($phase === 1) {
                if ($scorer === 'player') {
                    if ($puckVelocity > 15) {
                        $userPrompt = "The player just scored a goal with a furious, incredibly high speed strike (velocity: " . number_format($puckVelocity, 1) . " px/frame). "
                            . "You are terrified, deeply shaken, and plead for them to calm down or show mercy. Keep it fun and dramatic. Mention their aggressive hit.";
                    } else {
                        $userPrompt = "The player scored with a slow, careful, passive, defensive strike (velocity: " . number_format($puckVelocity, 1) . " px/frame). "
                            . "You are annoyed, teasing, and mock them as a fearful camper who only waits and scores cowards' goals.";
                    }
                } else {
                    $userPrompt = "You (the AI opponent) just scored a goal! Mock and roast the player's failed defense triumphantly. Keep it cheeky and hilarious.";
                }
            } else {
                $userPrompt = "A moment ago, you said: \"{$priorAiMessage}\". The human player replied: \"{$playerReply}\". "
                    . "Acknowledge and answer their reply in our gaming persona. Conclude this brief chat exchange. Keep it strictly under 15 words.";
            }

            // Call API
            $response = Http::withHeaders([
                'Content-Type' => 'application/json'
            ])->post($url, [
                'systemInstruction' => [
                    'parts' => [
                        ['text' => $systemPrompt]
                    ]
                ],
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $userPrompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.9
                ]
            ]);

            if ($response->successful()) {
                $content = $response->json();
                $replyText = $content['candidates'][0]['content']['parts'][0]['text'] ?? 'Ayo lanjut!';
                return response()->json([
                    'success' => true,
                    'text' => trim($replyText)
                ]);
            }

            return response()->json([
                'success' => true,
                'text' => 'Ayo buruan mulai lagi, berisik!'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => true,
                'text' => 'Ayo buruan mulai lagi, berisik!'
            ]);
        }
    }
}
