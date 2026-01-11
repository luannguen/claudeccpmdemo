
/**
 * 🎨 Beautiful Toast Notification System
 */

export function showToast(message, type = 'success') {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600',
    info: 'bg-blue-600'
  };

  const toast = document.createElement('div');
  toast.className = `fixed bottom-24 right-6 ${colors[type]} text-white px-6 py-4 rounded-2xl shadow-2xl z-[200] animate-slide-up flex items-center gap-3 max-w-md`;
  toast.innerHTML = `
    <span class="text-2xl">${icons[type]}</span>
    <span class="font-medium">${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slide-down 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

export default showToast;

// Add animations
if (!document.getElementById('toast-animations')) {
  const style = document.createElement('style');
  style.id = 'toast-animations';
  style.innerHTML = `
    @keyframes slide-up {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes slide-down {
      from { transform: translateY(0); opacity: 1; }
      to { transform: translateY(100%); opacity: 0; }
    }
    .animate-slide-up { animation: slide-up 0.3s ease-out; }
  `;
  document.head.appendChild(style);
}
