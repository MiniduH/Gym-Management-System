'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, QrCode, Loader2, CheckCircle } from 'lucide-react';
import { generateAndDownloadUserPDF, UserQRData } from '@/lib/userQR';
import Barcode from 'react-barcode';
import { toast } from 'sonner';
import { useGetUserBarcodeQuery } from '@/store/services/userApi';

interface UserQRCardProps {
  userData: UserQRData;
  onClose?: () => void;
}

export const UserQRCard: React.FC<UserQRCardProps> = ({ userData, onClose }) => {
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  // Use the API to get barcode data
  const { data: barcodeData, isLoading: isGenerating, error } = useGetUserBarcodeQuery(userData.id);

  useEffect(() => {
    if (error) {
      console.error('Error fetching barcode data:', error);
      toast.error('Failed to load barcode data');
    }
  }, [error]);

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true);
    try {
      await generateAndDownloadUserPDF(userData);
      toast.success('Barcode PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return 'destructive';
      case 'TRAINEE':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role.toUpperCase()) {
      case 'USER':
        return 'Regular User';
      case 'ADMIN':
        return 'Administrator';
      case 'TRAINEE':
        return 'Trainer';
      default:
        return role;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <CardTitle className="text-lg">User Created Successfully!</CardTitle>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          User card with barcode has been generated
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* User Info */}
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-lg">
            {userData.first_name} {userData.last_name}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {userData.email}
          </p>
          <div className="flex justify-center">
            <Badge variant={getRoleBadgeVariant(userData.role)}>
              {getRoleDisplayName(userData.role)}
            </Badge>
          </div>
        </div>

        {/* Barcode */}
        <div className="flex flex-col items-center space-y-3">
          <div className="p-4 bg-white rounded-lg border-2 border-slate-200 dark:border-slate-700">
            {isGenerating ? (
              <div className="w-48 h-24 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-sm">Generating Barcode...</span>
              </div>
            ) : barcodeData?.data?.barcodeValue ? (
              <Barcode
                value={barcodeData.data.barcodeValue}
                format="CODE128"
                width={2}
                height={60}
                fontSize={14}
                margin={10}
              />
            ) : (
              <div className="w-48 h-24 flex items-center justify-center text-red-500">
                <QrCode className="w-12 h-12" />
                <span className="ml-2 text-sm">Failed to generate</span>
              </div>
            )}
          </div>

          {barcodeData?.data?.barcodeValue && (
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
              {barcodeData.data.barcodeValue}
            </p>
          )}

          <p className="text-xs text-center text-slate-500 dark:text-slate-400 max-w-xs">
            Scan this barcode for gym access, check-in, and user verification
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleDownloadPDF}
            disabled={isGenerating || isDownloadingPDF}
            className="w-full gap-2"
          >
            {isDownloadingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download User Card PDF
              </>
            )}
          </Button>

          {onClose && (
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Close
            </Button>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p className="font-medium">Instructions:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Print the PDF card for the user</li>
            <li>Keep the QR code safe for gym access</li>
            <li>Use QR code for quick check-in and verification</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};