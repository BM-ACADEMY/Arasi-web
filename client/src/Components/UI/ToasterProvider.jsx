import { Toaster } from "react-hot-toast";

const ToasterProvider = () => {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        duration: 4000,
        style: {
          background: '#333',
          color: '#fff',
        },
        success: {
          style: { background: '#ecfdf5', color: '#047857' },
        },
        error: {
          style: { background: '#fef2f2', color: '#b91c1c' },
        },
      }}
    />
  );
};

export default ToasterProvider;