'use client';

import FormInput from './form-input';
import FormButton from './form-button';
import { useAction } from '@/hooks/use-action';
import { createBoard } from '@/actions/create-board';

export default function Form() {
  // const initialState: CreateBoardState = {
  //   message: '',
  //   errors: {},
  // };
  // const [state, dispatch] = useFormState(createBoard, initialState);

  const { execute, fieldErrors } = useAction(createBoard, {
    onSuccess: (data) => {
      console.log(data, 'SUCCESS!');
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const onSubmit = (formData: FormData) => {
    const title = formData.get('title') as string;

    execute({ title });
  };

  return (
    <form action={onSubmit}>
      <div className="flex flex-col space-y-2">
        <FormInput errors={fieldErrors} />
        <FormButton />
      </div>
    </form>
  );
}
