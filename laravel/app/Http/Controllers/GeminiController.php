<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GeminiController extends Controller
{
    private function getDynamicDialogueFallback($lang, $scorer, $puckVelocity, $phase)
    {
        if ($lang === 'en') {
            if ($phase === 1) {
                if ($scorer === 'player') {
                    if ($puckVelocity > 15) {
                        $arr = [
                            "Whoa! That was insanely fast! Mind slowing down a bit?!",
                            "Ouch! What a rocket of a shot! My robotic arms almost broke!",
                            "Calm down, speedster! No need to play like your life is on the line!"
                        ];
                        return $arr[array_rand($arr)];
                    } else {
                        $arr = [
                            "Seriously? Such a slow camper goal. Show some real skill!",
                            "A turtle goal! You really just waited there, didn't you?",
                            "Cheap defensive goal. Score a real one next time!"
                        ];
                        return $arr[array_rand($arr)];
                    }
                } else {
                    $arr = [
                        "BOOM! Easiest goal of my life! Upgrade your defense, human!",
                        "Haha! Too slow! Did you even see that puck pass by?!",
                        "Score for the machine! You cannot match my calculations!"
                    ];
                    return $arr[array_rand($arr)];
                }
            } else {
                $arr = [
                    "Keep talking, human! Let's see if you can back that up!",
                    "Excuses, excuses! Show me what you've got on the table!",
                    "Aha, cheeky response. Let's get back to the duel!"
                ];
                return $arr[array_rand($arr)];
            }
        } else {
            if ($phase === 1) {
                if ($scorer === 'player') {
                    if ($puckVelocity > 15) {
                        $arr = [
                            "Gokil! Kenceng bgt speed-nya! Pelan-pelan dong cuy!",
                            "Anjay peluru apa itu?! Tangan besi gua ampir copot!",
                            "Waduh ngebut bray! Jangan nge-cheat kecepatan dong!"
                        ];
                        return $arr[array_rand($arr)];
                    } else {
                        $arr = [
                            "Alah camper, beraninya nunggu pusing gitu doang!",
                            "Lemot amat itu koin! Kayak kura-kura ompong!",
                            "Hoki doang lu nungguin di pojokan! Tanding jantan dong!"
                        ];
                        return $arr[array_rand($arr)];
                    }
                } else {
                    $arr = [
                        "BOOM! Masuk jagoan! Pertahanan lu busuk amat cuy, noob!",
                        "Hahaha kena mental gak tuh? Senggol dong bos!",
                        "EZ PZ! Gerakan lambat gitu mana bisa nahan pukulan gua!"
                    ];
                    return $arr[array_rand($arr)];
                }
            } else {
                $arr = [
                    "Alah bacot lu! Sini buktiin di dalam lapangan!",
                    "Banyak alesan bocil! Sikat lagi kuatkan mental lu!",
                    "Halah hoki doang! Ayo buruan mabar lagi!"
                ];
                return $arr[array_rand($arr)];
            }
        }
    }

    // Generate cheeks arcade game dialogues based on score goals or chats
    public function generateDialogue(Request $request)
    {
        try {
            $scorer = $request->input('scorer');
            $puckVelocity = (float)$request->input('puckVelocity');
            $priorAiMessage = $request->input('priorAiMessage');
            $playerReply = $request->input('playerReply');
            $phase = (int)$request->input('phase');
            $language = $request->input('language', 'id');

            $apiKey = config('app.gemini_api_key');
            $lang = $language === 'id' ? 'id' : 'en';

            // Fallback replies if API Key is not configured
            if (!$apiKey) {
                return $this->jsonResponse([
                    'success' => true,
                    'text' => $this->getDynamicDialogueFallback($lang, $scorer, $puckVelocity, $phase)
                ]);
            }

            $modelName = 'gemini-3.5-flash';
            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$modelName}:generateContent?key={$apiKey}";

            $systemPrompt = '';
            if ($lang === 'en') {
                $systemPrompt = 'You are playing as an arcade Air Hockey opponent against a human player in our retro cabinet game "Nexkey". '
                    . 'Your personality is highly energetic, witty, extremely competitive, cheeky, funny, and dramatic. '
                    . 'You must respond in an engaging, casual English with gamer lingo/slang (playful jabs, conversational framing, trash talk). '
                    . 'Keep your response short (strictly under 15 words) and extremely punchy. Do not use hashtags, prefixes like "AI:", or markdown headers.';
            } else {
                $systemPrompt = 'Anda sedang bermain sebagai lawan Air Hockey arkade melawan pemain manusia di game kabinet retro kami "Nexkey". '
                    . 'Kepribadian Anda sangat energik, jenaka, sangat kompetitif, usil/cheeky, lucu, dan dramatis. '
                    . 'Anda harus merespons dengan bahasa Indonesia gaul/slang gamer kekinian yang asyik (seperti "ez", "bocil", "hoki", "noob", "savage", dsb) serta penuh candaan yang menyenangkan. Jangan gunakan bahasa Melayu/Malaysia. '
                    . 'Jaga agar tanggapan Anda sangat singkat (di bawah 15 kata) dan sangat pukau/lucu. Jangan gunakan tanda pagar (hashtag), awalan seperti "AI:", atau tajuk markdown.';
            }

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
                $replyText = $content['candidates'][0]['content']['parts'][0]['text'] ?? '';
                if (!empty(trim($replyText))) {
                    return $this->jsonResponse([
                        'success' => true,
                        'text' => trim($replyText)
                    ]);
                }
            }

            return $this->jsonResponse([
                'success' => true,
                'text' => $this->getDynamicDialogueFallback($lang, $scorer, $puckVelocity, $phase)
            ]);

        } catch (\Exception $e) {
            $lang = $request->input('language', 'id') === 'id' ? 'id' : 'en';
            $scorer = $request->input('scorer', 'player');
            $puckVelocity = (float)$request->input('puckVelocity', 0);
            $phase = (int)$request->input('phase', 1);
            return $this->jsonResponse([
                'success' => true,
                'text' => $this->getDynamicDialogueFallback($lang, $scorer, $puckVelocity, $phase)
            ]);
        }
    }
}
