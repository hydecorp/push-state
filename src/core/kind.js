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
}

export class Hint extends Kind {
  constructor(event) {
    super(event);
    this.href = event.currentTarget.href;
  }
}

export class Pop extends Kind {
  constructor(event) {
    super(event);
    this.href = window.location.href;
  }
}
