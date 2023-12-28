'use client';

import { toast } from 'sonner';
import { ElementRef, useRef, useState } from 'react';
import { Board } from '@prisma/client';

import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/form/form-input';
import { updateBoard } from '@/actions/update-board';
import { useAction } from '@/hooks/use-action';

interface BoardTitleFormProps {
  data: Board;
}

/**
 * Board Title Form
 *
 * @description 보드 제목을 변경할 수 있는 컴포넌트
 *
 * @param data 보드 데이터
 */
export const BoardTitleForm = ({ data }: BoardTitleFormProps) => {
  const { execute } = useAction(updateBoard, {
    onSuccess: (data) => {
      toast.success(`Board "${data.title}" updated!`);
      setTitle(data.title);
      disableEditing();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const formRef = useRef<ElementRef<'form'>>(null);
  const inputRef = useRef<ElementRef<'input'>>(null);

  const [title, setTitle] = useState(data.title);
  const [isEditing, setIsEditing] = useState(false);

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 10);
  };

  const disableEditing = () => {
    setIsEditing(false);
  };

  const onSubmit = (formData: FormData) => {
    const title = formData.get('title') as string;

    execute({
      title,
      id: data.id,
    });
  };

  /**
   * ? Blur 이벤트를 사용해서 Form이 Unfocus 되었을 시 Form Submit 이벤트를 발생시킨다.
   */
  const onBlur = () => {
    formRef.current?.requestSubmit();
  };

  if (isEditing) {
    return (
      <form
        action={onSubmit}
        ref={formRef}
        className="flex items-center gap-x-2"
      >
        <FormInput
          ref={inputRef}
          id="title"
          onBlur={onBlur}
          defaultValue={title}
          className="text-lg font-bold px-[7px] py-1 h-7 bg-transparent focus-visible:outline-none focus-visible:ring-transparent border-none"
        />
      </form>
    );
  }

  return (
    <Button
      onClick={enableEditing}
      variant="transparent"
      className="font-bold text-lg h-auto w-auto p-1 px-2"
    >
      {title}
    </Button>
  );
};
