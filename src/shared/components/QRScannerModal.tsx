import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Icon } from '@/shared/components';

interface QRScannerModalProps {
  onClose: () => void;
  onScan: (result: string) => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ onClose, onScan }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const startScanner = async () => {
      if (!containerRef.current) return;

      try {
        scannerRef.current = new Html5Qrcode('qr-reader');

        await scannerRef.current.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            onScan(decodedText);
            stopScanner();
            onClose();
          },
          () => {
            // QR code not found - this is normal, continue scanning
          }
        );
      } catch (err) {
        console.error('Error starting scanner:', err);
      }
    };

    const stopScanner = async () => {
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
          scannerRef.current.clear();
        } catch (e) {
          // Ignore stop errors
        }
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [onClose, onScan]);

  const handleClose = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        // Ignore
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-6">
        <button
          onClick={handleClose}
          className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center text-white"
        >
          <Icon name="close" />
        </button>
        <span className="text-white text-xs font-bold uppercase tracking-widest opacity-60">
          QR Сканер
        </span>
        <div className="w-12"></div>
      </div>

      <div className="relative w-80 h-80">
        <div
          id="qr-reader"
          ref={containerRef}
          className="w-full h-full rounded-3xl overflow-hidden"
        />

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-16 h-16 border-l-4 border-t-4 border-white rounded-tl-3xl"></div>
          <div className="absolute top-0 right-0 w-16 h-16 border-r-4 border-t-4 border-white rounded-tr-3xl"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 border-l-4 border-b-4 border-white rounded-bl-3xl"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-r-4 border-b-4 border-white rounded-br-3xl"></div>
        </div>
      </div>

      <div className="mt-12 text-center px-8">
        <p className="text-white/60 text-sm">
          Наведите камеру на QR-код или штрих-код товара
        </p>
      </div>
    </div>
  );
};

export default QRScannerModal;
