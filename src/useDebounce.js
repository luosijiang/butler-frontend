import { useState, useEffect } from 'react';

export default function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // 设置定时器，在延迟时间后更新值
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 每次 value 变化时（用户连续输入），清理上一次的定时器重新计时
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}