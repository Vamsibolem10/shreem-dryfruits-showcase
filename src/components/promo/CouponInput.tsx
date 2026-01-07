import React, { useState } from 'react';
import { Tag, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePromo } from '@/context/PromoContext';

interface CouponInputProps {
  orderTotal: number;
  onApply: (discount: number, code: string) => void;
  onRemove: () => void;
  appliedCode?: string;
  appliedDiscount?: number;
}

export default function CouponInput({ 
  orderTotal, 
  onApply, 
  onRemove,
  appliedCode,
  appliedDiscount 
}: CouponInputProps) {
  const { validateCoupon, coupons } = usePromo();
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleApply = () => {
    if (!code.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setIsValidating(true);
    setError('');
    setSuccess('');

    // Simulate network delay
    setTimeout(() => {
      const result = validateCoupon(code, orderTotal);
      
      if (result.valid) {
        setSuccess(result.message);
        onApply(result.discount, code.toUpperCase());
        setCode('');
      } else {
        setError(result.message);
      }
      
      setIsValidating(false);
    }, 500);
  };

  const handleRemove = () => {
    onRemove();
    setSuccess('');
    setError('');
  };

  // Get active coupons for display
  const activeCoupons = coupons.filter(c => c.isActive && new Date(c.validUntil) > new Date());

  return (
    <div className="space-y-4">
      {/* Applied Coupon */}
      {appliedCode && appliedDiscount ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">{appliedCode}</p>
                <p className="text-sm text-green-600">You save ₹{appliedDiscount}</p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="p-1 text-green-600 hover:text-green-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Coupon Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={code}
                onChange={e => {
                  setCode(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="Enter coupon code"
                className="pl-10 uppercase"
                onKeyDown={e => e.key === 'Enter' && handleApply()}
              />
            </div>
            <Button
              onClick={handleApply}
              disabled={isValidating}
              variant="outline"
              className="shrink-0"
            >
              {isValidating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Apply'
              )}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <X className="w-4 h-4" />
              {error}
            </p>
          )}

          {/* Success Message */}
          {success && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              {success}
            </p>
          )}

          {/* Available Coupons */}
          {activeCoupons.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Available Coupons:</p>
              <div className="space-y-2">
                {activeCoupons.slice(0, 3).map(coupon => (
                  <button
                    key={coupon.id}
                    onClick={() => setCode(coupon.code)}
                    className="w-full text-left p-3 bg-[hsl(42,75%,55%)]/10 border border-[hsl(42,75%,55%)]/30 rounded-lg hover:bg-[hsl(42,75%,55%)]/20 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-[hsl(42,80%,35%)]">
                        {coupon.code}
                      </span>
                      <span className="text-sm bg-[hsl(42,75%,55%)] text-[hsl(25,30%,15%)] px-2 py-0.5 rounded-full font-medium">
                        {coupon.discountPercent}% OFF
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Min. order ₹{coupon.minOrderAmount} • Max. discount ₹{coupon.maxDiscount}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
