import React, {useState, useEffect} from 'react';
import {X} from 'lucide-react';
import DOMPurify from 'dompurify';

interface TokenInfoProps {
  isOpen: boolean;
  onClose: () => void;
  isPage?: boolean;
}

const TokenInfo: React.FC<TokenInfoProps> = ({isOpen, onClose, isPage = false}) => {
  const [sessionData, setSessionData] = useState<Record<string, unknown> | null>(null);
  const [decodedToken, setDecodedToken] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const findSessionData = () => {
      // Find session storage key that matches the pattern
      const sessionKey = Object.keys(sessionStorage).find(key => key.startsWith('session_data-instance_'));

      if (sessionKey) {
        const data = sessionStorage.getItem(sessionKey);
        if (data) {
          try {
            const parsedData = JSON.parse(data);
            setSessionData(parsedData);

            // Decode the ID token if present
            if (parsedData.id_token) {
              const decoded = decodeJWT(parsedData.id_token);
              setDecodedToken(decoded);
            }
          } catch (error) {
            console.error('Error parsing session data:', error);
          }
        }
      }
    };

    findSessionData();

    // Set up an interval to check for changes (optional)
    const interval = setInterval(findSessionData, 5000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const decodeJWT = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join(''),
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const highlightJSON = (obj: Record<string, unknown>) => {
    const jsonString = JSON.stringify(obj, null, 2);
    const lines = jsonString.split('\n');

    const highlightedHTML = lines
      .map(line => {
        // Escape HTML first
        let escapedLine = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // Apply syntax highlighting
        escapedLine = escapedLine
          // Property names (keys)
          .replace(/(\s*)"([^"]+)"(\s*:)/g, '$1<span class="text-blue-600 font-medium">"$2"</span>$3')
          // String values
          .replace(/:\s*"([^"]*)"/g, ': <span class="text-green-600">"$1"</span>')
          // Numbers
          .replace(/:\s*(-?\d+(?:\.\d+)?)/g, ': <span class="text-purple-600">$1</span>')
          // Booleans
          .replace(/:\s*(true|false)/g, ': <span class="text-orange-600 font-semibold">$1</span>')
          // Null
          .replace(/:\s*(null)/g, ': <span class="text-red-600 font-semibold">$1</span>')
          // Punctuation
          .replace(/([{}[\],])/g, '<span class="text-gray-600">$1</span>');

        return escapedLine;
      })
      .join('\n');

    // Sanitize the HTML with DOMPurify
    return DOMPurify.sanitize(highlightedHTML, {
      ALLOWED_TAGS: ['span'],
      ALLOWED_ATTR: ['class'],
      KEEP_CONTENT: true,
    });
  };

  const renderSessionData = () => {
    if (!sessionData) return <p className="text-gray-500">No session data found</p>;

    // Format the session data with readable timestamps
    const formattedData = {...sessionData};
    if (formattedData.created_at) {
      formattedData.created_at_readable = formatDate((formattedData.created_at as number) / 1000);
    }

    const highlightedJSON = highlightJSON(formattedData);

    return (
      <div className="overflow-auto">
        <pre
          className="text-sm font-mono whitespace-pre-wrap break-words"
          dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(highlightedJSON)}}
        />
      </div>
    );
  };

  const renderDecodedToken = () => {
    if (!decodedToken) return <p className="text-gray-500">No decoded token available</p>;

    // Format the decoded token with readable timestamps
    const formattedToken = {...decodedToken};
    ['exp', 'iat', 'nbf'].forEach(key => {
      if (formattedToken[key]) {
        formattedToken[`${key}_readable`] = formatDate(formattedToken[key] as number);
      }
    });

    const highlightedJSON = highlightJSON(formattedToken);

    return (
      <div className="overflow-auto">
        <pre
          className="text-sm font-mono whitespace-pre-wrap break-words"
          dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(highlightedJSON)}}
        />
      </div>
    );
  };

  if (!isOpen) return null;

  const content = (
    <>
      {!isPage && (
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Token Information</h1>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      )}

      <div className={isPage ? 'p-0' : 'p-6 overflow-auto max-h-[calc(90vh-120px)]'}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Session Data</h2>
            {renderSessionData()}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Decoded ID Token</h2>
            {renderDecodedToken()}
          </div>
        </div>
      </div>
    </>
  );

  if (isPage) {
    return content;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">{content}</div>
    </div>
  );
};

export default TokenInfo;
