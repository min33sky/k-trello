'use client';

import { ListWithCards } from '@/types';
import ListForm from './list-form';
import { useEffect, useState } from 'react';
import ListItem from './list-item';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import { useAction } from '@/hooks/use-action';
import { updateListOrder } from '@/actions/update-list-order';
import { updateCardOrder } from '@/actions/update-card-order';

/**
 * 배열에서 아이템 배열순서 바꾸기
 *
 * @param list 배열
 * @param startIndex 출발 인덱스
 * @param endIndex 도착 인덱스
 */
function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

interface ListContainerProps {
  data: ListWithCards[];
  boardId: string;
}

export default function ListContainer({ data, boardId }: ListContainerProps) {
  const [orderedData, setOrderedData] = useState(data);

  const { execute: executeUpdateListOrder } = useAction(updateListOrder, {
    onSuccess: () => {
      toast.success('List reordered');
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const { execute: executeUpdateCardOrder } = useAction(updateCardOrder, {
    onSuccess: () => {
      toast.success('Card reordered');
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  useEffect(() => {
    setOrderedData(data);
  }, [data]);

  const onDragEnd = (result: any) => {
    const { destination, source, type } = result;

    if (!destination) {
      return;
    }

    // 카드를 같은 위치로 이동시켰다면 처리하지 않는다.
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // 리스트를 이동시켰을 때 처리
    if (type === 'list') {
      const items = reorder(orderedData, source.index, destination.index).map(
        (item, index) => ({ ...item, order: index }),
      );

      // 클라이언트와 DB 모두 바뀐 정렬 순서를 저장한다.
      setOrderedData(items);
      executeUpdateListOrder({ items, boardId });
    }

    // 카드를 이동시켰을 때 처리
    if (type === 'card') {
      let newOrderedData = [...orderedData];

      // 기존 카드가 위치한 리스트와 이동할 리스트를 가져온다.
      const sourceList = newOrderedData.find(
        (list) => list.id === source.droppableId,
      );
      const destList = newOrderedData.find(
        (list) => list.id === destination.droppableId,
      );

      if (!sourceList || !destList) {
        return;
      }

      // 해당 리스트가 카드가 없는 리스트일 때 빈 배열을 설정
      if (!sourceList.cards) {
        sourceList.cards = [];
      }

      if (!destList.cards) {
        destList.cards = [];
      }

      //* 같은 리스트에서 카드 이동시 처리
      if (source.droppableId === destination.droppableId) {
        const reorderedCards = reorder(
          sourceList.cards,
          source.index,
          destination.index,
        );

        reorderedCards.forEach((card, idx) => {
          card.order = idx;
        });

        sourceList.cards = reorderedCards;

        setOrderedData(newOrderedData);
        executeUpdateCardOrder({
          boardId: boardId,
          items: reorderedCards,
        });
        //* 카드를 다른 리스트로 이동할 시 처리
      } else {
        // 소스 리스트에서 이동시킬 카드를 제거
        const [movedCard] = sourceList.cards.splice(source.index, 1);

        // 이동시킬 카드의 listId를 목적지 ListId로 변경
        movedCard.listId = destination.droppableId;

        // 목적지 리스트에 이동시킬 카드를 추가함
        destList.cards.splice(destination.index, 0, movedCard);

        // 리스트의 카드 순서 재정렬
        sourceList.cards.forEach((card, idx) => {
          card.order = idx;
        });

        destList.cards.forEach((card, idx) => {
          card.order = idx;
        });

        // 클라이언트와 DB에 모두 반영
        setOrderedData(newOrderedData);
        executeUpdateCardOrder({
          boardId: boardId,
          items: destList.cards,
        });
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="lists" type="list" direction="horizontal">
        {(provided) => (
          <ol
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex gap-x-3 h-full"
          >
            {orderedData.map((list, index) => {
              return <ListItem key={list.id} index={index} data={list} />;
            })}
            {provided.placeholder}
            <ListForm />
            <div className="flex-shrink-0 w-1" />
          </ol>
        )}
      </Droppable>
    </DragDropContext>
  );
}
