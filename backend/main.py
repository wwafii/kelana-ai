def print_trip_summary(
    destination: str,
    country: str,
    days: int,
    budget: float,
    currency: str,
    travel_month: str,
) -> None:
    """
    Mencetak ringkasan rencana perjalanan pengguna dengan format yang rapi dan terstruktur.
    """
    formatted_budget = (
        f"{int(budget)} {currency}"
        if budget.is_integer()
        else f"{budget} {currency}"
    )

    print("\n========================")
    print("KelanaAI")
    print("========================")
    print(f"Destination  : {destination}")
    print(f"Country      : {country}")
    print(f"Days         : {days}")
    print(f"Budget       : {formatted_budget}")
    print(f"Currency     : {currency}")
    print(f"Travel Month : {travel_month}")


def main() -> None:
    """
    Fungsi utama untuk menerima input interaktif dari pengguna dan menjalankan generator ringkasan perjalanan.
    """
    print("=== Welcome to KelanaAI Trip Summary Generator ===\n")

    destination = input("Enter destination: ").strip()
    country = input("Enter country: ").strip()
    days = int(input("Enter duration (days): ").strip())
    budget = float(input("Enter budget: ").strip())
    currency = input("Enter currency (e.g. USD, IDR): ").strip()
    travel_month = input("Enter travel month: ").strip()

    print_trip_summary(
        destination=destination,
        country=country,
        days=days,
        budget=budget,
        currency=currency,
        travel_month=travel_month,
    )


if __name__ == "__main__":
    main()
