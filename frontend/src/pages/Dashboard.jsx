import { useCurrentUser } from '../hooks/useCurrentUser';

function Dashboard() {
  const { user, isLoaded, displayName, email, avatar } = useCurrentUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-ikkilamchi">Yuklanmoqda...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <img
          src={avatar}
          alt={displayName}
          className="w-16 h-16 rounded-full border-2 border-vodiy-qaragayi"
        />
        <div>
          <h1 className="font-heading text-3xl text-archa-tuni">
            Salom, {displayName}!
          </h1>
          <p className="text-ikkilamchi mt-1">{email}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-ikkilamchi/20 p-8 text-center">
        <h2 className="font-heading text-xl text-archa-tuni mb-2">
          Hozircha hech narsa yo'q
        </h2>
        <p className="text-ikkilamchi mb-6">
          Keyingi darslarda bu yerga tog'laringizni qo'shishni o'rganamiz.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;