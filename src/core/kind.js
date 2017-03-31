// Copyright (c) 2017 Florian Klampfer
// Licensed under MIT

export class Kind {
  constructor(event) {
    this.event = event;
  }
}

export class Push extends Kind {
  constructor(event) {
    super(event);
    this.href = event.currentTarget.href;
  }

  get type() { return 'push'; }
}

export class Hint extends Kind {
  constructor(event) {
    super(event);
    this.href = event.currentTarget.href;
  }

  get type() { return 'hint'; }
}

export class Pop extends Kind {
  constructor(event) {
    super(event);
    this.href = window.location.href;
  }

  get type() { return 'pop'; }
}
