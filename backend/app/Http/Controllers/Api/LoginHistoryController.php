<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoginHistory;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LoginHistoryController extends Controller
{
    private function buildQuery(Request $request)
    {
        $query = LoginHistory::with('user:id,name');

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('date_from')) {
            $query->where('login_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $dateTo = Carbon::parse($request->date_to)->endOfDay();
            $query->where('login_at', '<=', $dateTo);
        }

        return $query;
    }

    public function index(Request $request): JsonResponse
    {
        return response()->json($this->buildQuery($request)->orderBy('login_at', 'desc')->paginate(20));
    }

    public function exportExcel(Request $request): StreamedResponse
    {
        $histories = $this->buildQuery($request)->orderBy('login_at', 'desc')->get();

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        $headers = ['ID', 'User', 'Login Time', 'Logout Time', 'IP Address', 'Device', 'Status'];
        foreach (range('A', 'G') as $i => $col) {
            $sheet->setCellValue($col.'1', $headers[$i]);
        }
        $sheet->getStyle('A1:G1')->getFont()->setBold(true);

        $row = 2;
        foreach ($histories as $h) {
            $sheet->setCellValue('A'.$row, $h->id);
            $sheet->setCellValue('B'.$row, $h->user?->name ?? '');
            $sheet->setCellValue('C'.$row, $h->login_at ? $h->login_at->format('Y-m-d H:i:s') : '');
            $sheet->setCellValue('D'.$row, $h->logout_at ? $h->logout_at->format('Y-m-d H:i:s') : '');
            $sheet->setCellValue('E'.$row, $h->ip_address ?? '');
            $sheet->setCellValue('F'.$row, $h->device ?? '');
            $sheet->setCellValue('G'.$row, $h->status ?? '');
            $row++;
        }

        foreach (range('A', 'G') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $response = new StreamedResponse(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        });

        $response->headers->set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $response->headers->set('Content-Disposition', 'attachment; filename="login-history-'.now()->format('Y-m-d').'.xlsx"');

        return $response;
    }
}
