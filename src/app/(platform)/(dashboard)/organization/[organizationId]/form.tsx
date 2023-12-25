'use client';

import { CreateBoardState, createBoard } from '@/actions/create-board';
import { useFormState } from 'react-dom';
import FormInput from './form-input';
import FormButton from './form-button';

export default function Form() {
  const initialState: CreateBoardState = {
    message: '',
    errors: {},
  };

  const [state, dispatch] = useFormState(createBoard, initialState);

  return (
    <form action={dispatch}>
      <div className="flex flex-col space-y-2">
        <FormInput errors={state?.errors} />
      </div>
      <FormButton />
    </form>
  );
}
