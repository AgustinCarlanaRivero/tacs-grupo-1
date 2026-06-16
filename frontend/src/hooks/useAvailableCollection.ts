import { useMemo } from "react";
import { useGetCollectionQuery } from "@/store/api/collectionApi";
import { useGetPostsQuery } from "@/store/api/postApi";
import { useGetOffersByUserQuery } from "@/store/api/offerApi";
import type { MockCollectionItem } from "@/data/types";

/**
 * Lockeo de figuritas (opción front-only): devuelve la colección del usuario
 * con la cantidad disponible ya descontando lo que tiene comprometido en
 * publicaciones activas y en ofertas enviadas pendientes.
 *
 * Limitación: el cálculo es del lado del cliente y no es atómico. El backend no
 * conoce este lock, así que es una protección de UI, no una reserva real.
 */
export function useAvailableCollection(
  userId: string | undefined
): MockCollectionItem[] {
  const { data: collectionData } = useGetCollectionQuery(userId ?? "", {
    skip: !userId,
  });
  const { data: myPosts = [] } = useGetPostsQuery(userId ?? "", {
    skip: !userId,
  });
  const { data: sentOffers = [] } = useGetOffersByUserQuery(
    { userId: userId ?? "", role: "sent" },
    { skip: !userId }
  );

  return useMemo(() => {
    const base: MockCollectionItem[] = (collectionData?.items ?? []).map(
      (item) => ({
        sticker: {
          number: item.sticker.number,
          player: item.sticker.player,
          type: item.sticker.type,
        },
        quantity: item.quantity,
      })
    );

    // stickerNumber -> cantidad ya comprometida
    const committed = new Map<number, number>();

    for (const post of myPosts) {
      if (post.state !== "ACTIVE") continue;
      const n = post.sticker.number;
      committed.set(n, (committed.get(n) ?? 0) + (post.quantity ?? 1));
    }

    for (const offer of sentOffers) {
      if (offer.state !== "PENDING") continue;
      for (const item of offer.offered) {
        const n = item.sticker.number;
        committed.set(n, (committed.get(n) ?? 0) + item.quantity);
      }
    }

    return base
      .map((item) => ({
        ...item,
        quantity: item.quantity - (committed.get(item.sticker.number) ?? 0),
      }))
      .filter((item) => item.quantity > 0);
  }, [collectionData, myPosts, sentOffers]);
}
