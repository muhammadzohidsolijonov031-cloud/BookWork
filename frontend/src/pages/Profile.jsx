import { useCurrentUser } from '../hooks/useCurrentUser';
import { useClerk } from '@clerk/react';
import { useNavigate } from 'react-router';

function Profile() {
  const { user, isLoaded, displayName, email, avatar } = useCurrentUser();
  const { openUserProfile, signOut } = useClerk();
  const navigate = useNavigate();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-ikkilamchi">Yuklanmoqda...</p>
      </div>
    );
  }

  if (!user) return null;

  const chiqish = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header — palette rangida */}
        <div className="h-32 bg-vodiy-qaragayi"></div>

        <div className="px-6 -mt-16 mb-6">
          <div className="flex flex-col items-center">
            <img
              src={avatar}
              alt={displayName}
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
            />
            <h1 className="font-heading text-2xl mt-4 text-archa-tuni">
              {displayName}
            </h1>
            <p className="text-ikkilamchi mt-1">{email}</p>
          </div>
        </div>

        <div className="border-t px-6 py-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-ikkilamchi">Foydalanuvchi ID</span>
            <span className="font-mono text-xs text-archa-tuni">{user.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ikkilamchi">Ro'yxatdan o'tgan</span>
            <span className="text-archa-tuni">
              {new Date(user.createdAt).toLocaleDateString('uz-UZ')}
            </span>
          </div>
        </div>

        <div className="border-t px-6 py-6 flex gap-3">
          <button
            onClick={() => openUserProfile()}
            className="flex-1 bg-asosiy text-ohaktosh py-2 rounded-lg hover:opacity-90 transition"
          >
            Hisobni sozlash
          </button>
          <button
            onClick={chiqish}
            className="flex-1 border border-ikkilamchi text-ikkilamchi py-2 rounded-lg hover:bg-ertalabki-tuman transition"
          >
            Chiqish
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;