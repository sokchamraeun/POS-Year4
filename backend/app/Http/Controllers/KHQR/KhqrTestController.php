<?php

namespace App\Http\Controllers\KHQR;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use KHQR\BakongKHQR;
use KHQR\Helpers\KHQRData;
use KHQR\Models\IndividualInfo;

class KhqrTestController extends Controller
{
    public function index()
    {
        return view('khqr.test');
    }

    public function generate(Request $request)
    {
        $data = $request->validate([
            'amount' => 'required|numeric|min:0.01',
        ]);

        $amount = $data['amount'];

        $individualInfo = new IndividualInfo(
            'sok_chamraeun@bkrt',
            'CHAMRAEUN SOK',
            'PHNOM PENH',
            null,
            null,
            KHQRData::CURRENCY_USD,
            (float) $amount,
            null,
            'POS Store',
        );

        $khqrResponse = BakongKHQR::generateIndividual($individualInfo);

        $qrString = null;
        $error = null;
        $debug = null;

        if ($khqrResponse->status['code'] !== 0) {
            $error = $khqrResponse->status['message'] ?? 'Failed to generate KHQR';
            $debug = json_encode($khqrResponse->status, JSON_PRETTY_PRINT);
        } else {
            $qrString = $khqrResponse->data['qr'];
            $debug = json_encode($khqrResponse->data, JSON_PRETTY_PRINT);
        }

        return view('khqr.test', compact('amount', 'qrString', 'error', 'debug'));
    }
}
