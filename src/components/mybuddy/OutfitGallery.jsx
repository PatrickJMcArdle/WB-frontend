export default function OutfitGallery({
  outfits,
  unlocked,
  equippedId,
  onEquip,
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {outfits.map((o) => {
        const isUnlocked = unlocked.includes(o.id);
        const isEquipped = equippedId === o.id;
        return (
          <div
            key={o.id}
            className={`border rounded p-3 ${!isUnlocked ? "opacity-50" : ""}`}
          >
            <div className="font-medium">{o.name}</div>
            <div className="text-xs text-gray-600">Unlock: Lv {o.minLevel}</div>
            <button
              className={`mt-2 px-3 py-1 rounded border ${
                isEquipped ? "bg-blue-600 text-white" : ""
              }`}
              onClick={() => isUnlocked && onEquip(o.id)}
              disabled={!isUnlocked}
            >
              {isEquipped ? "Equipped" : isUnlocked ? "Equip" : "Locked"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
