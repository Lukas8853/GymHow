import React, { useContext, useState, useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { ScrollMenu, VisibilityContext } from "react-horizontal-scrolling-menu";

import BodyPart from "./BodyPart";
import ExerciseCard from "./ExerciseCard";

const LeftArrow = ({ isCompact, onArrowNavigate }) => {
  const { scrollPrev } = useContext(VisibilityContext);

  return (
    <button
      type="button"
      onClick={() => {
        if (onArrowNavigate) {
          onArrowNavigate();
        }
        scrollPrev("smooth");
      }}
      aria-label="Previous"
      style={{
        position: "absolute",
        top: isCompact ? "46%" : "50%",
        left: isCompact ? "6px" : "12px",
        transform: "translateY(-50%)",
        width: isCompact ? "36px" : "42px",
        height: isCompact ? "36px" : "42px",
        borderRadius: "999px",
        border: "1px solid rgba(255, 255, 255, 0.25)",
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        color: "#fff",
        fontSize: isCompact ? "24px" : "30px",
        lineHeight: 1,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 5,
      }}
    >
      {"\u2039"}
    </button>
  );
};

const RightArrow = ({ isCompact, onArrowNavigate }) => {
  const { scrollNext } = useContext(VisibilityContext);

  return (
    <button
      type="button"
      onClick={() => {
        if (onArrowNavigate) {
          onArrowNavigate();
        }
        scrollNext("smooth");
      }}
      aria-label="Next"
      style={{
        position: "absolute",
        top: isCompact ? "46%" : "50%",
        right: isCompact ? "6px" : "12px",
        transform: "translateY(-50%)",
        width: isCompact ? "36px" : "42px",
        height: isCompact ? "36px" : "42px",
        borderRadius: "999px",
        border: "1px solid rgba(255, 255, 255, 0.25)",
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        color: "#fff",
        fontSize: isCompact ? "24px" : "30px",
        lineHeight: 1,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 5,
      }}
    >
      {"\u203A"}
    </button>
  );
};

const HorizontalScrollbar = ({ data, bodyPart, setBodyPart, isBodyParts }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [dots, setDots] = useState([]);
  const [activeDotIndex, setActiveDotIndex] = useState(0);
  const apiRef = useRef(null);
  const dotClickLockRef = useRef({ targetIndex: null, startedAt: 0 });
  const syncTimeoutsRef = useRef([]);
  const itemIds = data.map((item) => String(item.id || item));

  const clearPendingSyncTimeouts = () => {
    syncTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    syncTimeoutsRef.current = [];
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    return () => {
      clearPendingSyncTimeouts();
    };
  }, []);

  const getMostVisibleIndex = (api, items) => {
    const visibleItems = api?.visibleItems || [];
    if (!items.length || !visibleItems.length) {
      return -1;
    }

    let bestIndex = -1;
    let bestRatio = -1;

    visibleItems.forEach((rawVisibleId) => {
      const visibleId = String(rawVisibleId);
      const itemMeta = api.getItemById?.(visibleId);
      const itemIndex = Number(itemMeta?.index);
      const ratio = Number(itemMeta?.entry?.intersectionRatio ?? 0);

      if (!Number.isInteger(itemIndex) || itemIndex < 0) {
        return;
      }

      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestIndex = itemIndex;
      }
    });

    if (bestIndex >= 0) {
      return Math.min(items.length - 1, bestIndex);
    }

    const fallbackVisibleId = String(visibleItems[0]);
    const fallbackIndex = items.findIndex(
      (itemId) => itemId === fallbackVisibleId,
    );
    return fallbackIndex;
  };

  const syncDots = (api) => {
    if (!isBodyParts || !api) {
      return;
    }

    apiRef.current = api;

    const items = itemIds;
    const visibleItems = api.visibleItems || [];
    const visibleCount = Math.max(1, visibleItems.length || 1);
    const totalPages = isMobile
      ? Math.max(1, items.length)
      : Math.max(1, Math.ceil(items.length / visibleCount));
    const pageIndexes = Array.from({ length: totalPages }, (_, index) => index);

    setDots(pageIndexes);

    if (!items.length) {
      setActiveDotIndex(0);
      return;
    }

    if (!visibleItems.length) {
      return;
    }

    const mostVisibleIndex = getMostVisibleIndex(api, items);
    if (mostVisibleIndex < 0) {
      return;
    }

    const nextActiveIndex = Math.min(
      totalPages - 1,
      isMobile
        ? Math.max(0, mostVisibleIndex)
        : Math.max(0, Math.round(mostVisibleIndex / visibleCount)),
    );

    const { targetIndex, startedAt } = dotClickLockRef.current;
    if (targetIndex !== null) {
      const elapsed = Date.now() - startedAt;
      const isTargetReached = nextActiveIndex === targetIndex;
      const isExpired = elapsed > 500;

      if (!isTargetReached && !isExpired) {
        return;
      }

      dotClickLockRef.current = { targetIndex: null, startedAt: 0 };
    }

    setActiveDotIndex(nextActiveIndex);
  };

  const handleDotClick = (pageIndex) => {
    if (!apiRef.current) {
      return;
    }

    const items = itemIds;
    const visibleItems = apiRef.current.visibleItems || [];
    const visibleCount = Math.max(1, visibleItems.length || 1);
    const targetIndex = isMobile
      ? Math.min(items.length - 1, pageIndex)
      : Math.min(items.length - 1, pageIndex * visibleCount);
    const targetId = items[targetIndex];
    const targetItem = apiRef.current.getItemElementById?.(targetId);

    if (!targetItem || !apiRef.current.scrollToItem) {
      return;
    }

    apiRef.current.scrollToItem(targetItem, "smooth", "start", "nearest");
    dotClickLockRef.current = { targetIndex: pageIndex, startedAt: Date.now() };
    setActiveDotIndex(pageIndex);

    clearPendingSyncTimeouts();
    [120, 300, 520].forEach((delay) => {
      const timeoutId = setTimeout(() => {
        if (apiRef.current) {
          syncDots(apiRef.current);
        }
      }, delay);
      syncTimeoutsRef.current.push(timeoutId);
    });
  };

  const handleArrowNavigate = (direction) => {
    dotClickLockRef.current = { targetIndex: null, startedAt: 0 };

    if (isBodyParts && dots.length > 0) {
      const maxIndex = dots.length - 1;
      setActiveDotIndex((prev) =>
        direction === "next"
          ? Math.min(maxIndex, prev + 1)
          : Math.max(0, prev - 1),
      );
    }

    clearPendingSyncTimeouts();
    [120, 300, 520].forEach((delay) => {
      const timeoutId = setTimeout(() => {
        if (apiRef.current) {
          syncDots(apiRef.current);
        }
      }, delay);
      syncTimeoutsRef.current.push(timeoutId);
    });
  };

  const margin = isBodyParts
    ? isMobile
      ? "0 6px"
      : "0 10px"
    : isMobile
      ? "0 8px"
      : "0 40px";

  if (!isBodyParts) {
    return (
      <ScrollMenu LeftArrow={LeftArrow} RightArrow={RightArrow}>
        {data.map((item, index) => (
          <Box
            key={String(item.id || item)}
            itemId={String(item.id || item)}
            title={String(item.id || item)}
            margin={margin}
            sx={
              isMobile
                ? {
                    ...(index === 0 && { ml: "0" }),
                    ...(index === data.length - 1 && { mr: "0" }),
                  }
                : {}
            }
          >
            <ExerciseCard exercise={item} />
          </Box>
        ))}
      </ScrollMenu>
    );
  }

  return (
    <Box sx={{ position: "relative", pb: isBodyParts ? 4 : 0 }}>
      <ScrollMenu
        LeftArrow={() => (
          <LeftArrow
            isCompact={isMobile}
            onArrowNavigate={() => handleArrowNavigate("prev")}
          />
        )}
        RightArrow={() => (
          <RightArrow
            isCompact={isMobile}
            onArrowNavigate={() => handleArrowNavigate("next")}
          />
        )}
        apiRef={apiRef}
        onInit={syncDots}
        onUpdate={syncDots}
      >
        {data.map((item, index) => (
          <Box
            key={String(item.id || item)}
            itemId={String(item.id || item)}
            title={String(item.id || item)}
            margin={margin}
          >
            {isBodyParts ? (
              <BodyPart
                item={item}
                bodyPart={bodyPart}
                setBodyPart={setBodyPart}
              />
            ) : (
              <ExerciseCard exercise={item} />
            )}
          </Box>
        ))}
      </ScrollMenu>

      {isBodyParts && dots.length > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
            mt: 1.5,
          }}
        >
          {dots.map((pageIndex) => (
            <button
              key={pageIndex}
              type="button"
              aria-label={`Go to slide ${pageIndex + 1}`}
              onClick={() => handleDotClick(pageIndex)}
              style={{
                width: activeDotIndex === pageIndex ? "18px" : "8px",
                height: "8px",
                borderRadius: "999px",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "all 0.2s ease",
                backgroundColor:
                  activeDotIndex === pageIndex
                    ? "#FF2625"
                    : "rgba(255, 255, 255, 0.35)",
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default HorizontalScrollbar;
