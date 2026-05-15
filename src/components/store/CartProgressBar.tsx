"use client";

import { Gift, Check } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

interface Props {
  currentTotal: number;
  target: number;
  reward: string;
  coupon?: string;
}

export function CartProgressBar({ currentTotal, target, reward, coupon }: Props) {
  const { formatAmount } = useCurrency();
  const progress = Math.min(100, (currentTotal / target) * 100);
  const remaining = Math.max(0, target - currentTotal);
  const achieved = remaining === 0;

  return (
    <div className="mx-4 mb-3 p-3 rounded-xl bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border border-primary-100 dark:border-primary-800">
      <div className="flex items-start gap-2 mb-2">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${achieved ? "bg-green-500" : "bg-primary-100 dark:bg-primary-800"}`}>
          {achieved ? (
            <Check className="h-3 w-3 text-white" />
          ) : (
            <Gift className="h-3 w-3 text-primary-600 dark:text-primary-400" />
          )}
        </div>
        {achieved ? (
          <div>
            <p className="text-xs font-bold text-green-700 dark:text-green-300">
              🎉 مبروك! حصلت على {reward}
            </p>
            {coupon && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                كود الخصم:{" "}
                <span className="font-mono font-bold bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                  {coupon}
                </span>
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs font-medium text-primary-700 dark:text-primary-300 leading-relaxed">
            أضف{" "}
            <span className="font-bold">{formatAmount(remaining)}</span>{" "}
            للحصول على{" "}
            <span className="font-bold">{reward}</span>
          </p>
        )}
      </div>
      <div className="h-1.5 bg-primary-100 dark:bg-primary-900/40 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
