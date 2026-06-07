<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ShopItem;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ShopController extends Controller
{
    // Retrieve complete shop item list
    public function index()
    {
        try {
            $items = ShopItem::all();
            return $this->jsonResponse([
                'success' => true,
                'items' => $items
            ]);
        } catch (\Exception $e) {
            return $this->jsonResponse([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Purchase skin
    public function purchase(Request $request)
    {
        try {
            $request->validate([
                'userId' => 'required',
                'itemId' => 'required|string'
            ]);

            $userId = $request->input('userId');
            $itemId = $request->input('itemId');

            $user = User::find($userId);
            if (!$user) {
                return $this->jsonResponse([
                    'success' => false,
                    'error' => 'User not found'
                ], 404);
            }

            $item = ShopItem::find($itemId);
            if (!$item) {
                return $this->jsonResponse([
                    'success' => false,
                    'error' => 'Item not found'
                ], 404);
            }

            // Verify if owned
            $owned = Inventory::where('user_id', $userId)->where('item_id', $itemId)->exists();
            if ($owned) {
                return $this->jsonResponse([
                    'success' => false,
                    'error' => 'Item already purchased'
                ], 400);
            }

            // Verify funds
            if ($user->currency < $item->cost) {
                return $this->jsonResponse([
                    'success' => false,
                    'error' => 'Insufficient credits'
                ], 400);
            }

            // Transaction
            DB::transaction(function () use ($user, $item, $userId, $itemId) {
                $user->decrement('currency', $item->cost);
                Inventory::create([
                    'user_id' => $userId,
                    'item_id' => $itemId
                ]);
            });

            // Get updated inventory
            $inventory = Inventory::where('user_id', $userId)->pluck('item_id')->toArray();

            return $this->jsonResponse([
                'success' => true,
                'user' => $user->fresh(),
                'inventory' => $inventory
            ]);

        } catch (\Exception $e) {
            return $this->jsonResponse([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Equip item skin
    public function equip(Request $request)
    {
        try {
            $request->validate([
                'userId' => 'required',
                'itemId' => 'required|string'
            ]);

            $userId = $request->input('userId');
            $itemId = $request->input('itemId');

            $user = User::find($userId);
            if (!$user) {
                return $this->jsonResponse([
                    'success' => false,
                    'error' => 'User not found'
                ], 404);
            }

            $item = ShopItem::find($itemId);
            if (!$item) {
                return $this->jsonResponse([
                    'success' => false,
                    'error' => 'Item not found'
                ], 404);
            }

            // Ensure ownership
            $owned = Inventory::where('user_id', $userId)->where('item_id', $itemId)->exists();
            if (!$owned) {
                return $this->jsonResponse([
                    'success' => false,
                    'error' => 'You do not own this skin'
                ], 400);
            }

            // Update respective active skin categories
            if ($item->category === 'paddle') {
                $user->update(['active_paddle_skin' => $itemId]);
            } elseif ($item->category === 'board') {
                $user->update(['active_board_skin' => $itemId]);
            }

            return $this->jsonResponse([
                'success' => true,
                'user' => $user->fresh()
            ]);

        } catch (\Exception $e) {
            return $this->jsonResponse([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
