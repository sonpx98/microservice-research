import { useState } from 'react';

interface APIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

export function APIKeyModal({ isOpen, onClose, onSave }: APIKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<'groq' | 'gemini'>('groq');

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem(`${provider}_api_key`, apiKey.trim());
      onSave(apiKey.trim());
      setApiKey('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className='tw:fixed  tw:inset-0  tw:bg-black  tw:bg-opacity-50  tw:dark:bg-opacity-70  tw:flex  tw:items-center  tw:justify-center  tw:z-50'>
      <div className='tw:bg-white  tw:dark:bg-gray-800  tw:rounded-lg  tw:p-6  tw:max-w-md  tw:w-full  tw:mx-4'>
        <h3 className='tw:text-lg  tw:font-bold  tw:text-gray-800  tw:dark:text-gray-100  tw:mb-4'>
          🔑 Cấu hình API Key miễn phí
        </h3>

        <div className='tw:space-y-4'>
          <div>
            <label className='tw:block  tw:text-sm  tw:font-medium  tw:text-gray-700  tw:dark:text-gray-300  tw:mb-2'>
              Chọn nhà cung cấp AI:
            </label>
            <select
              value={provider}
              onChange={e => setProvider(e.target.value as 'groq' | 'gemini')}
              className='tw:w-full  tw:border  tw:border-gray-300  tw:dark:border-gray-600  tw:rounded-lg  tw:px-3  tw:py-2  tw:bg-white  tw:dark:bg-gray-700  tw:text-gray-900  tw:dark:text-gray-100'
            >
              <option value='groq'>🚀 Groq (Llama 3.1) - Khuyên dùng</option>
              <option value='gemini'>🧠 Google Gemini Flash</option>
            </select>
          </div>

          <div>
            <label className='tw:block  tw:text-sm  tw:font-medium  tw:text-gray-700  tw:dark:text-gray-300  tw:mb-2'>
              API Key:
            </label>
            <input
              type='password'
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={`Nhập  ${provider === 'groq' ? 'Groq' : 'Gemini'}  API  key...`}
              className='tw:w-full  tw:border  tw:border-gray-300  tw:dark:border-gray-600  tw:rounded-lg  tw:px-3  tw:py-2  tw:bg-white  tw:dark:bg-gray-700  tw:text-gray-900  tw:dark:text-gray-100'
            />
          </div>

          <div className='tw:bg-blue-50  tw:dark:bg-blue-900/20  tw:rounded-lg  tw:p-3  tw:text-sm'>
            <p className='tw:font-medium  tw:text-blue-800  tw:dark:text-blue-300  tw:mb-1'>
              {provider === 'groq'
                ? '🚀  Groq  (Miễn  phí)'
                : '🧠  Google  Gemini  (Miễn  phí)'}
            </p>
            <p className='tw:text-blue-700  tw:dark:text-blue-400'>
              {provider === 'groq'
                ? 'Tạo  tại:  console.groq.com/keys  -  6,000  token/phút  miễn  phí'
                : 'Tạo  tại:  aistudio.google.com/app/apikey  -  15  requests/phút  miễn  phí'}
            </p>
            <p className='tw:text-blue-600  tw:dark:text-blue-400  tw:text-xs  tw:mt-1'>
              API key được lưu trên máy tính của bạn, hoàn toàn an toàn.
            </p>
          </div>
        </div>

        <div className='tw:flex  tw:gap-3  tw:mt-6'>
          <button
            onClick={onClose}
            className='tw:flex-1  tw:px-4  tw:py-2  tw:border  tw:border-gray-300  tw:dark:border-gray-600  tw:rounded-lg  tw:text-gray-700  tw:dark:text-gray-300  tw:hover:bg-gray-50  tw:dark:hover:bg-gray-700  tw:bg-white  tw:dark:bg-gray-800'
          >
            Huỷ
          </button>
          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className='tw:flex-1  tw:px-4  tw:py-2  tw:bg-purple-600  tw:dark:bg-purple-700  tw:text-white  tw:rounded-lg  tw:hover:bg-purple-700  tw:dark:hover:bg-purple-800  tw:disabled:bg-gray-300  tw:dark:disabled:bg-gray-600'
          >
            Lưu & Sử Dụng
          </button>
        </div>
      </div>
    </div>
  );
}
