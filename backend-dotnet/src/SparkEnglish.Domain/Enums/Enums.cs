using System.Text.Json.Serialization;

namespace SparkEnglish.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum UserRole { Parent = 0, Admin = 1 }

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TrialStatus { Pending = 0, Contacted = 1, Scheduled = 2, Cancelled = 3 }

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum CourseFormat { OneToOne = 0, MiniGroup = 1, Camp = 2 }
