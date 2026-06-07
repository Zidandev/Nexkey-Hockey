<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;

    protected function toCamelCaseKeys($data)
    {
        if ($data instanceof \Illuminate\Contracts\Support\Arrayable) {
            $data = $data->toArray();
        }

        if (!is_array($data)) {
            return $data;
        }

        $result = [];
        foreach ($data as $key => $value) {
            if (is_array($value) || $value instanceof \Illuminate\Contracts\Support\Arrayable) {
                $value = $this->toCamelCaseKeys($value);
            }

            $result[$key] = $value;

            // Generate camelCase key
            if (is_string($key) && strpos($key, '_') !== false) {
                $camelKey = lcfirst(str_replace(' ', '', ucwords(str_replace('_', ' ', $key))));
                $result[$camelKey] = $value;
            }
        }
        return $result;
    }

    protected function jsonResponse($data, $status = 200, array $headers = [], $options = 0)
    {
        return response()->json($this->toCamelCaseKeys($data), $status, $headers, $options);
    }
}
