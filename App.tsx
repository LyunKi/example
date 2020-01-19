import "reflect-metadata";

import {
  Ayanami,
  Effect,
  initDevtool,
  Module,
  Reducer,
  useAyanami,
  useAyanamiState,
  InjectableContext
} from "ayanami";
import React, { useCallback } from "react";
import { Button, Text, View } from "react-native";
import { Observable, of } from "rxjs";
import { mergeMap } from "rxjs/operators";

interface State {
  count: number;
}

interface TipsState {
  tips: string;
}

@Module("Tips")
class Tips extends Ayanami<TipsState> {
  defaultState = {
    tips: "123"
  };

  @Reducer()
  showTips(state: TipsState, tips: string): TipsState {
    return { ...state, tips };
  }
}

@Module("Count")
class Count extends Ayanami<State> {
  defaultState = {
    count: 0
  };

  otherProps = "";

  constructor(private readonly tips: Tips) {
    super();
  }

  @Reducer()
  add(state: State, count: number): State {
    return { count: state.count + count };
  }

  @Reducer()
  addOne(state: State): State {
    return { count: state.count + 1 };
  }

  @Reducer()
  reset(): State {
    return { count: 0 };
  }

  @Effect()
  minus(count$: Observable<number>): any {
    return count$.pipe(
      mergeMap(subCount =>
        of(
          this.getActions().add(-subCount),
          this.tips.getActions().showTips(`click minus Button at ${Date.now()}`)
        )
      )
    );
  }
}

function CountComponent() {
  const [{ count }, actions] = useAyanami(Count);
  const { tips } = useAyanamiState(Tips);

  const add = useCallback((count: number) => () => actions.add(count), [
    actions
  ]);
  const minus = useCallback((count: number) => () => actions.minus(count), [
    actions
  ]);
  const reset = useCallback(() => {
    actions.reset();
  }, [actions]);

  return (
    <View>
      <Text>count: {count}</Text>
      <Text>tips: {tips}</Text>
      <Button title={"123"} onPress={add(1)}>
        add one
      </Button>
      <Button title={"234"} onPress={minus(1)}>
        minus one
      </Button>
      <Button title={"345"} onPress={reset}>
        reset to zero
      </Button>
    </View>
  );
}

initDevtool();

export default function App() {
  return (
    <InjectableContext>
      <CountComponent />
    </InjectableContext>
  );
}
