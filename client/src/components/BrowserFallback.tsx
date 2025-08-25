// Убираем 'import React from 'react';'

export function BrowserFallback() {
  return (
    <div style={{
      padding: '20px',
      color: '#333',
      backgroundColor: '#f5f5f5',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ color: '#0088cc' }}>Горизонт | Mini App</h1>
      <p style={{ fontSize: '1.2em', maxWidth: '400px' }}>
        Это веб-приложение предназначено для запуска исключительно внутри Telegram.
      </p>
      <p style={{ marginTop: '30px', color: '#777' }}>
        Пожалуйста, откройте нашего бота в Telegram и запустите приложение оттуда.
      </p>
    </div>
  );
}