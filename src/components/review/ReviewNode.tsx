import type { Review } from "../../types/Review";

interface ReviewNodeProps {
  entry: { customer?: any; review: Review };
  level?: number;
}

export default function ReviewNode({ entry, level = 0 }: ReviewNodeProps) {
  const customer = entry.customer;
  const rev = entry.review;
  const anonymous = rev.isAnonymous ?? (rev as any).anonymous;
  const author = anonymous
    ? "Anonymous Guest"
    : customer?.fullName || customer?.userName || rev.customerId || "Guest";
  const avatar = customer?.avatarUrl || customer?.avatar || null;
  const rating = (rev as any).rating ?? 0;

  const renderStars = (rating?: number) => {
    const r = Math.round(rating ?? 0);
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < r ? "text-amber-400" : "text-gray-200"}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.384 2.455a1 1 0 00-.364 1.118l1.286 3.967c.3.921-.755 1.688-1.54 1.118L10 15.347l-3.384 2.455c-.784.57-1.84-.197-1.54-1.118l1.286-3.967a1 1 0 00-.364-1.118L2.614 9.394c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69L9.049 2.927z" />
          </svg>
        ))}
      </div>
    );
  };

  // Styling khác nhau cho customer review vs staff reply
  return (
    <div className={`${level > 0 ? "ml-12 mt-4" : ""}`}>
      {level === 0 ? (
        // Review cha - có border và chứa tất cả replies bên trong
        <article className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-5">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={author}
                    className="w-14 h-14 rounded-full object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                    {author.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{author}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(rev.reviewDate as any).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>{renderStars(rating)}</div>
                    <div className="text-sm text-gray-500">
                      {rating.toFixed(1) || "—"}
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-gray-700 leading-relaxed">
                  {rev.comment}
                </p>

                {/* show granular scores if present */}
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-600">
                  {typeof (rev as any).roomQuality === "number" && (
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      Room: {(rev as any).roomQuality}
                    </span>
                  )}
                  {typeof (rev as any).serviceQuality === "number" && (
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      Service: {(rev as any).serviceQuality}
                    </span>
                  )}
                  {typeof (rev as any).location === "number" && (
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      Location: {(rev as any).location}
                    </span>
                  )}
                  {typeof (rev as any).valueForMoney === "number" && (
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      Value: {(rev as any).valueForMoney}
                    </span>
                  )}
                  {/* show customer membership if available */}
                  {customer?.memberShipLevel && (
                    <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded">
                      {customer.memberShipLevel}
                    </span>
                  )}
                </div>

                {rev.images && rev.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {rev.images.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`rev-${i}`}
                        className="w-full h-48 object-cover rounded-lg shadow-sm"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Render replies bên trong cùng border - không có border riêng */}
          {rev.replies && rev.replies.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50">
              {rev.replies.map((reply, idx) => (
                <ReviewNode
                  key={reply.reviewID || idx}
                  entry={{ review: reply, customer: null }}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </article>
      ) : (
        // Review con - KHÔNG có border, chỉ có background và padding
        <div className="px-12 py-3 border-b border-gray-200 last:border-b-0">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-full bg-[#d4c5b9] flex items-center justify-center text-white font-bold text-lg">
                S
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Hotel Staff</div>
                  <div className="text-xs text-gray-500">
                    {new Date(rev.reviewDate as any).toLocaleDateString()}
                  </div>
                </div>
                <span className="px-3 py-1 bg-[#d4c5b9] text-white text-xs rounded-full font-medium">
                  Staff Response
                </span>
              </div>

              <p className="mt-3 text-gray-700 leading-relaxed">
                {rev.comment}
              </p>
            </div>
          </div>

          {/* Render nested replies nếu có */}
          {rev.replies && rev.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {rev.replies.map((reply, idx) => (
                <ReviewNode
                  key={reply.reviewID || idx}
                  entry={{ review: reply, customer: null }}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
